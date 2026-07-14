import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Accordion } from "./Accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  args: {
    items: [
      {
        title: "Caractéristiques",
        content: "Cuir pleine fleur tannage végétal, boucle laiton massif, coutures sellier.",
      },
      {
        title: "Guide des tailles",
        content: "Mesurez le tour de cou et ajoutez deux doigts d'aisance. En cas de doute, prenez la taille au-dessus.",
      },
      {
        title: "Entretien",
        content: "Nourrir le cuir deux fois par an avec un baume incolore. Éviter l'eau stagnante.",
      },
    ],
    defaultOpen: 0,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Accordéons plutôt qu'onglets pour les caractéristiques produit (D-024). Un seul panneau ouvert, chevron 250ms (4.1 §8).",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ToutFerme: Story = {
  args: { defaultOpen: undefined },
};
