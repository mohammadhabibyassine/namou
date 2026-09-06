import { noStoreJson } from "../../_shared/responses";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  return noStoreJson({ user: await getSession() });
}
