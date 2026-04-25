import AdSlot from "@/components/AdSlot";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdSlot slotKey="tools-top" label="Tools Top Banner" />
      {children}
      <AdSlot slotKey="tools-bottom" label="Tools Bottom Banner" variant="inline" />
    </>
  );
}
