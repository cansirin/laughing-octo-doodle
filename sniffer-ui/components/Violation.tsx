import { Code, Flex, Text } from "@radix-ui/themes";

export interface ViolationProps {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  nodes: string[];
}

const colorPalette = {
  critical: "red",
  serious: "orange",
  moderate: "yellow",
  minor: "green",
} as const;

export const Violation = ({
  id = "id",
  impact = "critical",
  description = "description",
  nodes = ["node1", "node2"],
}: ViolationProps) => {
  return (
    <Flex gap="3" direction="column">
      <Text as="div" size="2" weight="bold">
        ID: {id}
      </Text>
      <Text as="div" size="2" weight="bold">
        Impact: {impact}
      </Text>
      <Text as="div" size="2" color="gray">
        Description: {description}
      </Text>
      <Flex direction="column" gap="4">
        {nodes.map((node, index) => (
          <Code key={index} color={colorPalette[impact]} size="2" weight="bold">
            Node: {node}
          </Code>
        ))}
      </Flex>
    </Flex>
  );
};
