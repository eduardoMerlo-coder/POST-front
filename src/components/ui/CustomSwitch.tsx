import { Switch } from "@heroui/react";

export const CustomSwitch = ({ title }: { title: string }) => {
  return (
    <Switch defaultSelected size="sm">
      {title}
    </Switch>
  );
};
