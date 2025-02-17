import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { useForm, validationError } from "@rvf/remix";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { db } from "~/db/db.server";
import { reminder, reminderValidator } from "~/db/schema/reminder";
import reminderQueue from "~/queues/reminder.server";

export const meta: MetaFunction = () => {
  return [{ title: "Reminders" }];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { data, error } = await reminderValidator.validate(formData);

  if (error) {
    return validationError(error);
  }

  const { name, time } = data;
  if (time < new Date()) {
    return validationError({
      fieldErrors: {
        time: "Time must be in the future",
      },
    });
  }

  // Save to PG
  await db.insert(reminder).values({
    name,
    time,
  });

  // Send to quirrel
  await reminderQueue.enqueue(name, {
    runAt: new Date(time),
  });

  return redirect("/");
};

export const loader = async () => {
  const reminders = await db.query.reminder.findMany();
  return { reminders };
};

export default function Index() {
  const { reminders } = useLoaderData<typeof loader>();

  const reminder = useEventSource("/subscribe", {
    event: "new-reminder",
  });
  useEffect(() => {
    if (reminder) {
      // Example of reminder completion
      alert(reminder);
    }
  }, [reminder]);

  const form = useForm({
    validator: reminderValidator,
    method: "post",
  });

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-16 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            Reminders
          </h1>
        </header>
        <main className="w-full max-w-md">
          <Form {...form.getFormProps()} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                {...form.getInputProps("name")}
                type="text"
                placeholder="Get milk"
                required
                className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Time
              </label>
              <input
                type="datetime-local"
                {...form.getInputProps("time")}
                className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              {form.error("time") && (
                <div className="text-red-500 mt-1">{form.error("time")}</div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </Form>
          <h2 className="text-2xl mt-8 text-gray-800 dark:text-gray-100">
            Reminders
          </h2>
          <table className="w-full mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                  Name
                </th>
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr
                  key={reminder.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                    {reminder.name}
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                    {reminder.time.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
