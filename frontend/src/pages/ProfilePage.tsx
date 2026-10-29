import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';
import { useAuth } from '../auth/AuthProvider';

export function ProfilePage() {
  const { profile, profileError, isProfileLoading, refetchProfile } = useAuth();

  return (
    <div className="page">
      <PageHeader title="Profile" hint="GET /user/profile" />
      {isProfileLoading && <Loading />}
      <ApiError error={profileError} onRetry={refetchProfile} />
      {profile && (
        <>
          <Section title="Details">
          <dl className="fields">
            <div>
              <dt>Id</dt>
              <dd className="mono">{profile.id}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{profile.name ?? '—'}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{profile.last_name ?? '—'}</dd>
            </div>
          </dl>
          </Section>
          <RawJson data={profile} />
        </>
      )}
    </div>
  );
}
