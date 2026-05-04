import { createClient } from "@/lib/supabase/server";
import HeaderContent from "./header-content";

export default async function Header() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	return <HeaderContent user={user} />;
}