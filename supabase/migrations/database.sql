
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Doctors policies (public read, admin write)
CREATE POLICY "Anyone can view active doctors" ON public.doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Appointments policies
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile and patient role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some doctors
INSERT INTO public.doctors (first_name, last_name, specialization, email) VALUES
  ('Sarah', 'Johnson', 'General Medicine', 'sarah.johnson@clinic.com'),
  ('Michael', 'Chen', 'Cardiology', 'michael.chen@clinic.com'),
  ('Emily', 'Williams', 'Dermatology', 'emily.williams@clinic.com'),
  ('David', 'Brown', 'Orthopedics', 'david.brown@clinic.com');

-- Seed some services
INSERT INTO public.services (name, description, price, duration_minutes) VALUES
  ('General Consultation', 'Standard medical consultation', 50.00, 30),
  ('Cardiac Checkup', 'Complete cardiac examination', 150.00, 60),
  ('Skin Examination', 'Dermatological examination', 80.00, 30),
  ('X-Ray', 'Radiological imaging', 120.00, 45),
  ('Blood Test', 'Standard blood work panel', 40.00, 15);
