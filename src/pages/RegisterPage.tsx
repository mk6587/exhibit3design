
import AuthForm from "@/components/auth/AuthForm";
import Layout from "@/components/layout/Layout";

const RegisterPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
          <p className="text-center mb-6 text-muted-foreground">
            Join now to access $10 exhibition stand design files that save you time and money
          </p>
          <AuthForm type="register" />
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
