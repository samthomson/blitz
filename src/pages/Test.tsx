import { NewDMMessagingInterface } from "@/components/dm/NewDMMessagingInterface";

export function Test() {
  return (
    <div className="container mx-auto py-8 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">DM System Test Page</h1>
      <p className="text-muted-foreground mb-4">
        This page is wrapped in NewDMProvider. Testing the new DM system.
      </p>
      <hr className="mb-4" />
      <NewDMMessagingInterface className="h-full" />
    </div>
  );
}

export default Test;

