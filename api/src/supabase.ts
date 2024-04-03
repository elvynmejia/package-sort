import { createClient } from "@supabase/supabase-js";

export default createClient(
    process.env.SUPA_BASE_URL!,
    process.env.SUPA_BASE_ADMIN_API_KEY!
);

