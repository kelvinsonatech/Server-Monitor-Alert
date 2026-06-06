"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      toast({ title: "Settings saved", description: "Telegram configuration has been updated." });
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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your alert channels.</p>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Telegram Alerts
          </CardTitle>
          <CardDescription>Get notified instantly when a monitor goes down or comes back up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settingsLoading && !settings?.telegramConfigured && (
            <Alert className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <AlertTitle>Telegram not configured</AlertTitle>
              <AlertDescription>
                You won't receive any alerts until you configure a bot token and at least one chat ID.
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
                    <FormLabel>Bot Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={settings?.hasBotToken ? "Leave blank to keep existing token" : "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"}
                        {...field}
                        className="font-mono bg-background"
                        data-testid="input-bot-token"
                      />
                    </FormControl>
                    <FormDescription>Create a bot with @BotFather on Telegram to get your token.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium leading-none">Chat IDs</p>
                  <p className="text-sm text-muted-foreground mt-1">Add one or more recipients. Message @userinfobot on Telegram to get a chat ID.</p>
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
                              className="font-mono bg-background"
                              data-testid={`input-chat-id-${index}`}
                            />
                            {fields.length > 1 && (
                              <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} className="shrink-0 text-destructive hover:text-destructive">
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
                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  ADD RECIPIENT
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testMutation.mutate()}
                  disabled={!settings?.telegramConfigured || testMutation.isPending}
                  className="font-mono gap-2"
                  data-testid="button-test-telegram"
                >
                  <Send className="w-4 h-4" />
                  {testMutation.isPending ? "SENDING..." : "SEND TEST MESSAGE"}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="font-mono" data-testid="button-save-settings">
                  {updateMutation.isPending ? "SAVING..." : "SAVE CONFIGURATION"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
