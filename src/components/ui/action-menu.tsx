"use client";
import * as Context from "@radix-ui/react-context-menu";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
export interface MenuAction {
  label: string;
  run: () => void;
  disabled?: boolean;
  shortcut?: string;
  danger?: boolean;
}
export function ContextActionMenu({
  actions,
  children,
}: {
  actions: MenuAction[];
  children: ReactNode;
}) {
  return (
    <Context.Root>
      <Context.Trigger asChild>{children}</Context.Trigger>
      <Context.Portal>
        <Context.Content className="dropdown-menu editor-context-menu">
          {actions.map((action) => (
            <Context.Item
              key={action.label}
              disabled={action.disabled}
              onSelect={action.run}
              className={action.danger ? "danger" : ""}
            >
              {action.label}
              {action.shortcut && <kbd>{action.shortcut}</kbd>}
            </Context.Item>
          ))}
        </Context.Content>
      </Context.Portal>
    </Context.Root>
  );
}
export function ActionsMenu({ actions }: { actions: MenuAction[] }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="button button--ghost button--small">
        Actions
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="dropdown-menu editor-context-menu"
          align="end"
          sideOffset={8}
        >
          {actions.map((action) => (
            <Dropdown.Item
              key={action.label}
              disabled={action.disabled}
              onSelect={action.run}
              className={action.danger ? "danger" : ""}
            >
              {action.label}
              {action.shortcut && <kbd>{action.shortcut}</kbd>}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
