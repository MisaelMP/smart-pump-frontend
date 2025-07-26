import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { useAuthActions } from '@/stores/authStore';
import {
  ProfileUpdateSchema,
  type ProfileUpdateData,
  type User,
} from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProfileSectionProps {
  user: User;
  onUserUpdate: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onUserUpdate,
}) => {
  const { updateUser } = useAuthActions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: {
        first: user.name.first,
        last: user.name.last,
      },
      email: user.email,
      phone: user.phone,
      address: user.address,
      company: user.company,
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: {
        first: user.name.first,
        last: user.name.last,
      },
      email: user.email,
      phone: user.phone,
      address: user.address,
      company: user.company,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: ProfileUpdateData) => {
    setIsSubmitting(true);

    try {
      const updatedUser = await apiService.updateProfile(data);
      updateUser(updatedUser);
      setIsEditing(false);
      onUserUpdate();

      toast.success('Profile Updated', {
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Profile update failed';

      if (errorMessage.toLowerCase().includes('email already in use')) {
        setError('email', {
          message: 'This email is already in use by another account',
        });
      } else {
        toast.error('Update Failed', {
          description: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Profile Information
          </h3>
          <p className='text-sm text-gray-500'>
            Manage your personal information and contact details
          </p>
        </div>
        {!isEditing && (
          <Button
            variant='secondary'
            leftIcon={<Edit3 className='w-4 h-4' />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Personal Information */}
        <div>
          <h4 className='text-md font-medium text-gray-900 mb-4 flex items-center'>
            <UserIcon className='w-4 h-4 mr-2' />
            Personal Information
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='First Name'
              placeholder='Enter your first name'
              disabled={!isEditing}
              error={errors.name?.first?.message}
              {...register('name.first')}
            />
            <Input
              label='Last Name'
              placeholder='Enter your last name'
              disabled={!isEditing}
              error={errors.name?.last?.message}
              {...register('name.last')}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className='text-md font-medium text-gray-900 mb-4 flex items-center'>
            <Mail className='w-4 h-4 mr-2' />
            Contact Information
          </h4>
          <div className='space-y-4'>
            <Input
              label='Email Address'
              type='email'
              placeholder='Enter your email'
              leftIcon={<Mail className='w-4 h-4' />}
              disabled={!isEditing}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label='Phone Number'
              type='tel'
              placeholder='+1 (555) 123-4567'
              leftIcon={<Phone className='w-4 h-4' />}
              disabled={!isEditing}
              error={errors.phone?.message}
              helperText='Format: +1 (555) 123-4567'
              {...register('phone')}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className='text-md font-medium text-gray-900 mb-4 flex items-center'>
            <Building className='w-4 h-4 mr-2' />
            Additional Information
          </h4>
          <div className='space-y-4'>
            <Input
              label='Company'
              placeholder='Enter your company name'
              leftIcon={<Building className='w-4 h-4' />}
              disabled={!isEditing}
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label='Address'
              placeholder='Enter your full address'
              leftIcon={<MapPin className='w-4 h-4' />}
              disabled={!isEditing}
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <Button
              type='button'
              variant='secondary'
              leftIcon={<X className='w-4 h-4' />}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              leftIcon={<Save className='w-4 h-4' />}
              isLoading={isSubmitting}
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>

      {/* Read-only Information */}
      {!isEditing && (
        <div className='mt-6 pt-6 border-t'>
          <h4 className='text-md font-medium text-gray-900 mb-4'>
            Account Information
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-500'>Account ID:</span>
              <span className='ml-2 font-mono text-gray-900'>{user._id}</span>
            </div>
            <div>
              <span className='text-gray-500'>Account Status:</span>
              <span
                className={`ml-2 font-medium ${
                  user.isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className='text-gray-500'>Age:</span>
              <span className='ml-2 text-gray-900'>{user.age} years</span>
            </div>
            <div>
              <span className='text-gray-500'>Eye Color:</span>
              <span className='ml-2 text-gray-900 capitalize'>
                {user.eyeColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
