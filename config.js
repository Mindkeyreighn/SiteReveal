/*
  SiteReveal portable configuration.
  The anon key is designed by Supabase to be used in browser code.
  Never place a Supabase service-role key in this file.
*/
window.SITE_REVEAL_CONFIG = {
  supabaseUrl: "https://vlpfbnsxcqsswatstdqq.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscGZibnN4Y3Fzc3dhdHN0ZHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODA4NjYsImV4cCI6MjEwMDc1Njg2Nn0.wR7CHlEK8IYKhmMXcxCHK5ymB9gAtrvD8srIgjOpEY0",
  adminEmail: "freesevenluck@gmail.com",

  /*
    Public Stripe-hosted checkout URL. This is not an API key.
    Replace this one value with the live Payment Link after testing.
  */
  stripePaymentLink: "https://buy.stripe.com/test_bJedRbcw37H48mpfMw0Fi00",
  stripeMode: "sandbox"
};
