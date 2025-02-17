import { Queue } from "quirrel/remix";
import { emitter } from "../services/emitter.server";

export default Queue("/queues/reminder", async (data: string) => {
  emitter.emit("reminder", { data });
});
