
import AuthForm from "@/components/auth/AuthForm";
import Layout from "@/components/layout/Layout";

const LoginPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Exhibit3Design</h1>
          <p className="text-center mb-6 text-muted-foreground">
            Sign in to your account or create a new one to access premium exhibition stand designs
          </p>
          <AuthForm type="smart" />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
