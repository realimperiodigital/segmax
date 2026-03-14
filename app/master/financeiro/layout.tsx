import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MasterFinanceiroLayout({ children }: Props) {
  return <>{children}</>;
}