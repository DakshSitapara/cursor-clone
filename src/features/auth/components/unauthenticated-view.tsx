import { ShieldAlertIcon } from "lucide-react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const UnauthenticatedView = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-lg shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
        <Item
          variant="outline"
          className="rounded-xl border-border/60 bg-background/80 backdrop-blur"
        >
          <ItemMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <ShieldAlertIcon className="size-5" />
          </ItemMedia>

          <ItemContent>
            <ItemTitle className="text-lg font-semibold tracking-tight">
              Unauthorized Access
            </ItemTitle>
            <ItemDescription className="text-sm text-muted-foreground">
              Please sign in to continue.
            </ItemDescription>
          </ItemContent>

          <ItemActions>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </SignInButton>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
};
