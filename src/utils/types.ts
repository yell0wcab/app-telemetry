export const getTypedObjectKeys = <TObj extends {}>(o: TObj) => {
  return Object.keys(o) as Array<keyof TObj>;
}
