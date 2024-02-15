import { Button, Flex, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Violation, ViolationProps } from "components/Violation";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const url = String(formData.get("url"));

  const res = await fetch("http://localhost:3000/check-a11y", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      url,
      inapplicable: true,
      incomplete: true,
    }),
  });

  const data = await res.json();
  console.log(data);

  return { status: 200, body: data };
}

export default function Index() {
  const data = useActionData<typeof action>();
  const violations = data?.body?.violations;

  return (
    <Flex direction="column">
      <h1>
        Deliver Exceptional Web Access for Everyone, Everywhere, Every Time
      </h1>
      <h2>
        Evaluate your site&apos;s accessibility, uncover the root causes, and
        discover clear solutions for improvement.
      </h2>
      <Form method="post">
        <Flex gap="2">
          <TextField.Root>
            <TextField.Input
              name="url"
              size="3"
              placeholder="Get accessibility score.."
            />
          </TextField.Root>
          <Button type="submit" size="3">
            Check
          </Button>
        </Flex>
      </Form>
      {/* <Violation
        id="1"
        description="description"
        impact="serious"
        nodes={["node4", "node2"]}
      /> */}

      {violations && (
        <Flex gap="4">
          {violations.map((violation: ViolationProps) => (
            <Violation key={violation.id} {...violation} />
          ))}
        </Flex>
      )}
    </Flex>
  );
}
