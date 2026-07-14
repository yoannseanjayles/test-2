import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormField } from "./FormField";

const meta = {
  title: "UI/FormField",
  component: FormField,
  args: {
    label: "Adresse e-mail",
    type: "email",
    placeholder: "prenom@exemple.fr",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Champ 48px, label au-dessus, validation à la sortie du champ (D-032/D-033). L'erreur est reliée par aria-describedby et annoncée (role=alert).",
      },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AvecAide: Story = {
  args: { help: "Utilisée uniquement pour le suivi de votre commande." },
};

export const EnErreur: Story = {
  args: { error: "Cette adresse e-mail n'est pas valide." },
};
