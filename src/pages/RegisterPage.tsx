
import AuthForm from "@/components/auth/AuthForm";
import Layout from "@/components/layout/Layout";

const RegisterPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
          <AuthForm type="register" />
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
