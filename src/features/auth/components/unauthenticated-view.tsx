import { ShieldAlertIcon } from "lucide-react";
import { 
    Item, 
    ItemMedia, 
    ItemContent, 
    ItemActions,
    ItemFooter,
    ItemDescription,
    ItemHeader,
    ItemTitle 
} from "@/components/ui/item";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const UnauthenticatedView = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="w-full max-w-lg bg-muted">
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <ShieldAlertIcon />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Unauthorized Access</ItemTitle>
                        <ItemDescription>
                            You are not authorized to access this resource.
                        </ItemDescription>
                    </ItemContent>
                        <ItemActions>
                            <SignInButton mode="modal">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </SignInButton>
                            {/* <SignUpButton mode="modal">
                                <Button>
                                    Sign Up
                                </Button>
                            </SignUpButton> */}
                        </ItemActions>
                </Item>
            </div>
        </div>
    )
}