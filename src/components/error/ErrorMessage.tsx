export const ErrorMessage = ({
  existError,
  msg,
}: {
  existError: boolean;
  msg?: string;
}) => {
  if (!existError) <></>;
  return <div className="text-red-500 text-xs text-semibold">{msg}</div>;
};
