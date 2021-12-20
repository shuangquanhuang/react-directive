import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as babel from "@babel/core";
import jsx from "@babel/plugin-syntax-jsx";
import t from "babel-types";

const code = "const n = 1;";
const code1 = `
export default function App() {
    const visible=false;
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2 vif={visible} another="cs">
        <span>Start editing to see some magic happen!</span>
        <div vif={visible}>inner if</div>
      </h2>
    //   <div vif={visible}>inner if</div>
    </div>
  );
}


`;

// console.log(t

const innerVisitor = {
  JSX(path) {
    if (t.isJSXIdentifier(path.node, { name: "vif" })) {
    //   path.traverse(innerVisitor);
      console.log(JSON.stringify(path.node));
      console.log(JSON.stringify(path.parentPath.node));

      const attrPath = path.parentPath;
      // const jsxPath = attrPath.parentPath;
      // const containerPath = jsxPath.parentPath;

      const containerPath = path.findParent((p) => p.isJSXElement());

      attrPath.remove();
      containerPath.parentPath = null;
      try {
        containerPath.replaceWith(
          t.jSXExpressionContainer(
            t.logicalExpression(
              "&&",
              t.identifier("visible"),
              containerPath.node
            )
          )
        );
      } catch (e) {
        console.error("error", e);
      }
      containerPath.stop();
    }
  },
};

const output = babel.transformSync(code1, {
  plugins: [
    // your first babel plugin 😎😎
    function myCustomPlugin() {
      return {
        inherits: jsx.default,
        visitor: {
          Identifier(path) {
            // in this example change all the variable `n` to `x`
            if (path.isIdentifier({ name: "n" })) {
              path.node.name = "xtransformed";
            }
          },
          JSX(path) {
            path.traverse(innerVisitor);
          },
        },
      };
    },
  ],
});

console.log(output.code); // 'const x = 1;'
