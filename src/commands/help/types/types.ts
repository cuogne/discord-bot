export interface HelpCommand {
  name: string;
  description: string;
}

export interface HelpPage {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: number;
  commands: HelpCommand[];
}
