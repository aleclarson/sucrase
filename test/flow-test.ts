import {IMPORT_DEFAULT_PREFIX} from "./prefixes";
import {assertResult} from "./util";

function assertFlowResult(code: string, expectedResult: string): void {
  assertResult(code, expectedResult, {transforms: ["jsx", "imports", "flow"]});
}

function assertFlowESMResult(code: string, expectedResult: string): void {
  assertResult(code, expectedResult, {transforms: ["jsx", "flow"]});
}

describe("transform flow", () => {
  it("removes `import type` statements", () => {
    assertFlowResult(
      `
      import type {a} from 'b';
      import c from 'd';
      import type from 'e';
      import {f, type g} from 'h';
      import {type i, type j} from 'k';
      import type L from 'L';
    `,
      `"use strict";${IMPORT_DEFAULT_PREFIX}
      
      var _d = require('d'); var _d2 = _interopRequireDefault(_d);
      var _e = require('e'); var _e2 = _interopRequireDefault(_e);
      var _h = require('h');
      
      
    `,
    );
  });

  it("does not mistake ? in types for a ternary operator", () => {
    assertFlowResult(
      `
      type A<T> = ?number;
      const f = (): number => 3;
    `,
      `"use strict";
      
      const f = () => 3;
    `,
    );
  });

  it("properly removes class property variance markers", () => {
    assertFlowResult(
      `
      class C {
        +foo: number;
        -bar: number;
      }
    `,
      `"use strict";
      class C {
        
        
      }
    `,
    );
  });

  it("recognizes arrow function types in variable declarations", () => {
    assertFlowResult(
      `
      const x: a => b = 2;
    `,
      `"use strict";
      const x = 2;
    `,
    );
  });

  it("recognizes arrow function types within parameters", () => {
    assertFlowResult(
      `
      function partition<T>(
        list: T[],
        test: (T, number, T[]) => ?boolean,
      ): [T[], T[]] {
        return [];
      }
    `,
      `"use strict";
      function partition(
        list,
        test,
      ) {
        return [];
      }
    `,
    );
  });

  it("recognizes exact object types", () => {
    assertFlowResult(
      `
      function foo(): {| x: number |} {
        return 3;
      }
    `,
      `"use strict";
      function foo() {
        return 3;
      }
    `,
    );
  });

  it("handles `export type * from`", () => {
    assertFlowResult(
      `
      export type * from "a";
    `,
      `"use strict";
      
    `,
    );
  });

  it("handles `import ... typeof`", () => {
    assertFlowResult(
      `
      import {typeof a as b} from 'c';
      import typeof d from 'e';
    `,
      `"use strict";
      
      
    `,
    );
  });

  it("handles export type for individual types", () => {
    assertFlowResult(
      `
      export type {foo};
    `,
      `"use strict";
      
    `,
    );
  });

  it("properly parses import aliases with the flow parser", () => {
    assertFlowResult(
      `
      import { a as b } from "c";
    `,
      `"use strict";
      var _c = require('c');
    `,
    );
  });

  it("properly parses bounded type parameters", () => {
    assertFlowResult(
      `
      function makeWeakCache<A: B>(): void {
      }
    `,
      `"use strict";
      function makeWeakCache() {
      }
    `,
    );
  });

  it("properly handles star as an arrow type param", () => {
    assertFlowResult(
      `
      const x: *=>3 = null;
    `,
      `"use strict";
      const x = null;
    `,
    );
  });

  it("properly handles @@iterator in a declared class", () => {
    assertFlowResult(
      `
      declare class A {
        @@iterator(): Iterator<File>;
      }
    `,
      `"use strict";
      


    `,
    );
  });

  it("supports the implements keyword", () => {
    assertFlowResult(
      `
      declare class A implements B, C {}
    `,
      `"use strict";
      
    `,
    );
  });

  it("properly prunes flow imported names", () => {
    assertFlowESMResult(
      `
      import a, {type n as b, m as c, type d} from './e';
      import type f from './g';
    `,
      `
      import a, { m as c,} from './e';

    `,
    );
  });

  it("removes @flow directives", () => {
    assertFlowResult(
      `
      /* Hello @flow */
      // World @flow
      function foo(): number {
        return 3;
      }
      // @flow
    `,
      `"use strict";
      /* Hello  */
      // World 
      function foo() {
        return 3;
      }
      // 
    `,
    );
  });
});
