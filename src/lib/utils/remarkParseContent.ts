import { visit } from "unist-util-visit";

/**
 * Extracts plain text from all child nodes of a heading
 */
function extractTextFromNode(node: any) {
  if (node.type === "text") {
    return node.value;
  }
  if ("children" in node) {
    return node.children.map(extractTextFromNode).join("");
  }
  return "";
}

/**
 * Remark plugin to:
 * - Add classes in markdown headings using [.class .another-class]
 * - Add `loading="lazy"` to images
 */
export default function remarkParseContent() {
  return (tree: any) => {
    visit(tree, "heading", (node: any) => {
      if (!node.children || node.children.length === 0) return;

      // Extract full heading text, even if it's wrapped in **bold** or *italic*
      const headingText = node.children.map(extractTextFromNode).join("");

      const classRegex = /\[([^\]]+)\]/g;
      const classes: string[] = [];
      let match;

      // Extract class names
      while ((match = classRegex.exec(headingText)) !== null) {
        const classList = match[1]
          .split(/\s+/)
          .filter((cls) => cls.startsWith("."));
        classes.push(...classList.map((cls) => cls.slice(1)));
      }

      // Remove class notation from heading children
      node.children = node.children.map(
        (child: { type: string; value: string }) => {
          if (child.type === "text") {
            return {
              ...child,
              value: child.value.replace(classRegex, "").trim(),
            };
          }
          return child;
        },
      );

      if (classes.length > 0) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.class = [
          ...(node.data.hProperties.class
            ? node.data.hProperties.class.split(" ")
            : []),
          ...classes,
        ].join(" ");
      }
    });

    // Process images to add `loading="lazy"`
    visit(tree, "image", (node: any) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.loading = "lazy";
    });
  };
}
