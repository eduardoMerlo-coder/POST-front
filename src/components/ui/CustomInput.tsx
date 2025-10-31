import { Field, Input } from "@chakra-ui/react";

export const CustomInput = () => {
  return (
    <Field.Root invalid={false}>
      <Field.Label>First name</Field.Label>
      <Input />
      <Field.ErrorText>Field is necesary</Field.ErrorText>
    </Field.Root>
  );
};
