import { BookOpen, ClipboardList, Fingerprint, Heart, HelpCircle, Mail, MessageCircle, Settings } from "lucide-react";

/** Resolves a Lucide icon name string to the actual component. */
export function resolveIcon(name: string, size: number, strokeWidth = 1.5) {
    const props = { size, strokeWidth };
    switch (name) {
        case "BookOpen":
            return <BookOpen {...props} />;
        case "ClipboardList":
            return <ClipboardList {...props} />;
        case "Fingerprint":
            return <Fingerprint {...props} />;
        case "MessageCircle":
            return <MessageCircle {...props} />;
        case "Heart":
            return <Heart {...props} />;
        case "Mail":
            return <Mail {...props} />;
        case "Settings":
            return <Settings {...props} />;
        default:
            return <HelpCircle {...props} />;
    }
}
