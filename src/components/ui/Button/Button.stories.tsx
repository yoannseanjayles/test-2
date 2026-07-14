import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Ajouter au panier" },
  parameters: {
    docs: {
      description: {
        component:
          "4 variantes (4.1 §6). Hiérarchie D-022 : un seul `primary` par écran. Hauteur min 44px, état loading avec label conservé.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Voir le guide des tailles" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary", children: "Tous les guides" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Filtrer" },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Rupture de stock" },
};
