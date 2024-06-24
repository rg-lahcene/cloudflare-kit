import type { PageServerLoad } from "./$types";
import { PARSE_SERVER_URL } from "$env/static/private";
import { env } from "$env/dynamic/private";

export const load = (() => {
  return {
    var: PARSE_SERVER_URL,
    node: env.NODE,
  };
}) satisfies PageServerLoad;
