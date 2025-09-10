import { Literal } from "@blacksmithgu/datacore";
import { isValidElement, ReactNode, useContext, useMemo, useRef } from "react";
import { CURRENT_FILE_CONTEXT, Lit } from "./markdown";

/**
 * "Interns" the incoming value, returning the oldest equal instance. This is a trick to improve React diffing
 *  behavior, as two objects which are equals via equality(a, b) will return the same object reference after being
 *  interned.
 */
export function useInterning<T>(value: T, equality: (a: T, b: T) => boolean): T {
    const ref = useRef<T>(undefined);

    if (ref.current === undefined || !equality(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}

/**
 * Ensure that a given literal or element input is rendered as a JSX.Element.
 * @hidden
 */
export function useAsElement(element: ReactNode | Literal): ReactNode {
    const sourcePath = useContext(CURRENT_FILE_CONTEXT);

    return useMemo(() => {
        if (isValidElement(element)) {
            return element as ReactNode;
        } else {
            return <Lit sourcePath={sourcePath} inline={true} value={element as Literal} />;
        }
    }, [element]);
}
