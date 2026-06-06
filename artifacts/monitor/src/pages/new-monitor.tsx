import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useCreateMonitor, getListMonitorsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  intervalMinutes: z.coerce.number().min(1).max(60),
});

export default function NewMonitor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createMonitor = useCreateMonitor();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "https://",
      intervalMinutes: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMonitor.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          toast({
            title: "Monitor created",
            description: `${data.name} will now be checked every ${data.intervalMinutes} minutes.`,
          });
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setLocation("/");
        },
        onError: (err: any) => {
          toast({
            title: "Error creating monitor",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Monitor</h1>
          <p className="text-muted-foreground text-sm">Configure a new endpoint to track.</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle>Target Details</CardTitle>
          <CardDescription>What should we keep an eye on?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Production API" {...field} className="font-mono bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/health" {...field} className="font-mono bg-background" />
                    </FormControl>
                    <FormDescription>
                      Must be a fully qualified HTTP or HTTPS URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Interval (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="60" {...field} className="font-mono bg-background" />
                    </FormControl>
                    <FormDescription>
                      How often we should ping this endpoint.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={createMonitor.isPending}
                  className="font-mono w-full sm:w-auto"
                >
                  {createMonitor.isPending ? "CREATING..." : "CREATE MONITOR"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
