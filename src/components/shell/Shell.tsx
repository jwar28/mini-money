import { Flex } from "@chakra-ui/react";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomNav } from "@/components/shell/BottomNav";
import { MobileTopBar } from "@/components/shell/MobileTopBar";
import { DesktopTopBar } from "@/components/shell/DesktopTopBar";
import { FloatingActionButton } from "@/components/transactions/FloatingActionButton";

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <Flex minH="100dvh" bg="bg.app" position="relative">
            <Sidebar />
            <Flex
                direction="column"
                flex="1"
                minW={0}
                ml={{ base: 0, md: "260px" }}
            >
                <MobileTopBar />
                <DesktopTopBar />
                <Flex
                    direction="column"
                    flex="1"
                    minW={0}
                    overflowX="hidden"
                    px={{ base: 4, md: 8 }}
                    pt={{ base: 4, md: 6 }}
                    pb={{ base: 24, md: 10 }}
                    maxW={{ md: "1280px" }}
                    w="full"
                    mx={{ md: "auto" }}
                >
                    {children}
                </Flex>
            </Flex>
            <BottomNav />
            <FloatingActionButton />
        </Flex>
    );
}
