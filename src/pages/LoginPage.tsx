
import AuthForm from "@/components/auth/AuthForm";
import Layout from "@/components/layout/Layout";

const LoginPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Login to Your Account</h1>
          <p className="text-center mb-6 text-muted-foreground">
            Access your purchased designs or buy affordable exhibition stand files for just $10
          </p>
          <AuthForm type="login" />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
