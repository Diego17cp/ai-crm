export interface IEventNotifier {
    notifyHumanAssistanceRequired(conversacionId: string, info?: any): void;
}