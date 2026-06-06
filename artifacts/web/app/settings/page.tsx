"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Send, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function fetchSettings() {
  const res = await fetch(`${base}/api/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function updateSettings(data: { telegramBotToken?: string; telegramChatId?: string }) {
  const res = await fetch(`${base}/api/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

async function testTelegram() {
  const res = await fetch(`${base}/api/settings/test-telegram`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to test Telegram");
  return res.json();
}

const formSchema = z.object({
  telegramBotToken: z.string().optional(),
  chatIds: z.array(z.object({ value: z.string().min(1, "Chat ID cannot be empty") })),
});

type FormValues = z.infer<typeof formSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Telegram configuration updated." });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      form.setValue("telegramBotToken", "");
    },
    onError: () => toast({ title: "Error saving settings", variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: testTelegram,
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Test message sent", description: result.message });
      } else {
        toast({ title: "Test failed", description: result.message, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Test failed", description: "Check your token and chat IDs.", variant: "destructive" }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { telegramBotToken: "", chatIds: [{ value: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "chatIds" });

  useEffect(() => {
    if (settings) {
      const ids = settings.telegramChatId
        ? settings.telegramChatId.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      form.reset({
        telegramBotToken: "",
        chatIds: ids.length > 0 ? ids.map((v: string) => ({ value: v })) : [{ value: "" }],
      });
    }
  }, [settings]);

  function onSubmit(values: FormValues) {
    const telegramChatId = values.chatIds.map((c) => c.value.trim()).filter(Boolean).join(",");
    updateMutation.mutate({ telegramBotToken: values.telegramBotToken, telegramChatId });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure how you receive alerts.</p>
      </div>

      <Card className="bg-card border-border/60">
        <CardHeader className="border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Telegram Alerts</CardTitle>
              <CardDescription className="text-sm mt-0.5">Get notified instantly when a monitor goes down or recovers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {!settingsLoading && settings?.telegramConfigured && (
            <Alert className="bg-green-500/8 text-green-400 border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <AlertDescription className="text-green-400 text-sm">Telegram is configured and active.</AlertDescription>
            </Alert>
          )}
          {!settingsLoading && !settings?.telegramConfigured && (
            <Alert className="bg-yellow-500/8 text-yellow-400/90 border-yellow-500/20">
              <AlertDescription className="text-sm">
                <span className="font-semibold">Not configured.</span> You won't receive alerts until you add a bot token and chat ID below.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="telegramBotToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Bot Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={settings?.hasBotToken ? "Leave blank to keep existing token" : "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"}
                        {...field}
                        className="font-mono text-sm bg-background/80 border-border/80 h-10"
                        data-testid="input-bot-token"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Create a bot with <span className="font-mono text-primary">@BotFather</span> on Telegram to get your token.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium leading-none">Chat IDs</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    One or more recipients. Message <span className="font-mono text-primary">@userinfobot</span> on Telegram to get your chat ID.
                  </p>
                </div>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`chatIds.${index}.value`}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g. 123456789 or @channelname"
                              {...inputField}
                              className="font-mono text-sm bg-background/80 border-border/80 h-10"
                              data-testid={`input-chat-id-${index}`}
                            />
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(index)}
                                className="shrink-0 h-10 w-10 border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="gap-2 border-border/70 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />Add Recipient
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testMutation.mutate()}
                  disabled={!settings?.telegramConfigured || testMutation.isPending}
                  className="gap-2 border-border/70 text-sm"
                  data-testid="button-test-telegram"
                >
                  <Send className="w-4 h-4" />
                  {testMutation.isPending ? "Sending…" : "Send Test Message"}
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="shadow-sm shadow-primary/20"
                  data-testid="button-save-settings"
                >
                  {updateMutation.isPending ? "Saving…" : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
