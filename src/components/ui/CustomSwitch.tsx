import { Switch } from "@chakra-ui/react";

export const CustomSwitch = () => {
  return (
    <Switch.Root colorPalette={"cyan"}>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
};
