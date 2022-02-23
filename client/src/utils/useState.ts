// type, interface, function, class, enum, variable,
enum UseStateType {
  string = "string",
  number = "number",
  boolean = "boolean",
  object = "object",
  array = "array",
  any = "any",
}

export interface UseStateOptions {
  type: UseStateType;
  defaultValue?: any;
}

export function useState<T>(
  { defaultValue, options = { type: UseStateType.any } }: { defaultValue: T; options?: UseStateOptions; }): [T, (value: T) => void] {
  const [state, setState] = useState<T>({ defaultValue });
  const setStateWithType = (value: T) => {
    if (typeof value !== options.type) {
      throw new Error(`Type mismatch. Expected ${options.type} but got ${typeof value}`);
    }
    setState(value);
  };
  return [state, setStateWithType];
}
