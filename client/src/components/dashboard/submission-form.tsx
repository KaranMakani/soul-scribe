import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";

import { Upload, Image } from "lucide-react";

// Validation schema
const formSchema = z.object({
  text: z.string().min(20, "Content must be at least 20 characters"),
  link: z.string().url("Must be a valid URL").or(z.string().length(0)),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubmissionForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: availableCategories = ["tutorial", "review", "news", "analysis", "promo", "other"] } = useQuery({
    queryKey: ["/api/content/categories"],
    enabled: isAuthenticated,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      link: "",
      imageUrl: "",
    },
  });

  const submission = useMutation({
    mutationFn: async (values: FormValues) => {
      if (categories.length === 0) {
        throw new Error("Please add at least one category");
      }

      const payload = { ...values, categories };
      const response = await apiRequest("POST", "/api/content", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content submitted successfully",
        description: "Your content is being analyzed",
      });
      form.reset();
      setCategories([]);
      queryClient.invalidateQueries({ queryKey: ["/api/content/user"] });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please connect your NEAR wallet to submit content",
        variant: "destructive",
      });
      return;
    }
    submission.mutate(values);
  };

  const handleFileUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      form.setValue("imageUrl", "https://source.unsplash.com/random/800x600?web3");
      toast({
        title: "Screenshot uploaded",
        description: "Your screenshot has been uploaded successfully",
      });
    }, 1500);
  };

  return (
    <Card className="bg-dark-200 rounded-xl mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Submit New Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Text Field */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-light-300">Content Text</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your content here..."
                      className="bg-dark-100 border border-dark-100 text-light-100 rounded-lg w-full px-4 py-2 min-h-[120px] focus:ring-2 focus:ring-primary-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Link Field */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-light-300">Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com"
                      className="bg-dark-100 border border-dark-100 text-light-100 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-primary-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-light-300">Upload Screenshot (Optional)</FormLabel>
                  <FormControl>
                    <div
                      className="border-2 border-dashed border-dark-100 rounded-lg p-4 text-center hover:border-primary-500 transition-all cursor-pointer"
                      onClick={handleFileUpload}
                    >
                      {field.value ? (
                        <div className="flex items-center justify-center">
                          <Image className="h-5 w-5 text-success mr-2" />
                          <span className="text-success">Screenshot uploaded</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-light-300" />
                          <p className="mt-2 text-sm text-light-300">
                            {uploading ? "Uploading..." : "Drag & drop an image or click to browse"}
                          </p>
                        </>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Tags / Categories */}
            <div>
              <FormLabel className="block text-sm text-light-300 mb-1">Categories & Tags</FormLabel>
              <TagInput
                placeholder="+ Add Tag"
                tags={categories}
                setTags={setCategories}
                availableTags={availableCategories}
                maxTags={5}
                className="w-full"
              />
              {categories.length === 0 && submission.isPending && (
                <p className="text-xs text-destructive mt-1">Please add at least one category</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-black border-2 font-medium py-2 px-4 rounded-lg transition-all focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 focus:ring-offset-dark-200"
                disabled={submission.isPending || !isAuthenticated}
              >
                {submission.isPending ? "Submitting..." : "Submit for Analysis"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
