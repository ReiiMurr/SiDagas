"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function createAgentAction(formData: {
  email: string;
  fullName: string;
  password: string;
}) {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.");
  }

  // Admin client bypasses RLS
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true, // Auto confirm since admin created it
      user_metadata: { full_name: formData.fullName }
    });

    if (authError) {
      console.error("Auth Creation Error:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user.id;

    // 2. The trigger 'on_auth_user_created' might have already created a profile 
    // with role 'user'. We need to update it to 'agen'.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        role: "agen", 
        full_name: formData.fullName,
        email: formData.email 
      })
      .eq("id", userId);

    if (profileError) {
      // If trigger didn't exist, try insert
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email: formData.email,
          role: "agen",
          full_name: formData.fullName
        });
      
      if (insertError) {
        console.error("Profile Error:", insertError);
        return { success: false, error: "Terdapat masalah saat membuat profil agen." };
      }
    }

    revalidatePath("/dashboard/admin/agents");
    return { success: true };
  } catch (error: any) {
    console.error("Agent Creation Panic:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}
