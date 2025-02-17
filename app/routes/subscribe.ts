import type { LoaderFunctionArgs } from "@remix-run/node";

import { eventStream } from "remix-utils/sse/server";
import { emitter } from "~/services/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    function handle({ data }: { data: string }) {
      send({ event: "new-reminder", data });
    }
    emitter.on("reminder", handle);
    return function clear() {
      emitter.off("reminder", handle);
    };
  });
}
