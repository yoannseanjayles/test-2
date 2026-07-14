import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Badges produit (4.1 §6). La couleur n'est jamais seule porteuse de sens : le libellé dit tout.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Nouveau: Story = {
  args: { variant: "new", children: "Nouveau" },
};

export const Rupture: Story = {
  args: { variant: "stock", children: "Bientôt de retour" },
};

export const Neutre: Story = {
  args: { variant: "neutral", children: "Fabriqué en France" },
};
