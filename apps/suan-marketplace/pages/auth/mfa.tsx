import dynamic from 'next/dynamic';
import Image from 'next/image';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import EnableMFA from '@marketplaces/ui-lib/src/lib/auth/EnableMFA';
import { useEffect, useState } from 'react';
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference, fetchMFAPreference, getCurrentUser, UpdateMFAPreferenceInput } from '@aws-amplify/auth';
import VerifyCodeMFA from '@marketplaces/ui-lib/src/lib/auth/VerifyCodeMFA'

const Login = (props: any) => {
    const [setupMFA, setSetupMFA] = useState<any>('')
    const [user, setUser] = useState('')
    const setupTOTP1 = async () => {
        try {
            const user = await getCurrentUser();
            setUser(user.username)
            const code = await setUpTOTP();
            const setup = code.getSetupUri('Terrasacha', user.username)
            //const fetchpreference = await fetchMFAPreference()
            //const verifyTOTP = await verifyTOTPSetup({code: ''}) 
            //console.log('fetchMFAPreference:' ,fetchpreference)
            //console.log('verifyTOTP:' ,verifyTOTP)
            console.log('setUpTOTP: ', setup)
            // Generar un QR Code basado en el código proporcionado
            //const totpCode = `otpauth://totp/AWSCognito:${user.username}?secret=${code.sharedSecret}&issuer=Terrasacha`;
            setSetupMFA(setup)
        } catch (error) {
            console.error('Error setting up TOTP:', error);
        }
    }

    useEffect(() =>{
        setupTOTP1()
    },[])
    const updataMFA = async () =>{
      const input : UpdateMFAPreferenceInput = {
        totp: 'ENABLED'      }
      /* const result = await updateMFAPreference({ totp: 'PREFERRED'}) */
        const verify = verifyTOTPSetup({ code: ''})
        const result = await updateMFAPreference({ totp: 'ENABLED'} )
        console.log(verify, 'result')
    }
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-50">
      <div className="h-auto items-center gap-y-2 flex-col  w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <button onClick={() =>  updataMFA()} className='py-2 px-8 bg-slate-300 hover:bg-slate-400 rounded-md'>update MFA preference</button>
        <h2>user: {user}</h2>
        <EnableMFA qr={setupMFA}  logo="/images/home-page/suan_logo.png"/>
        <VerifyCodeMFA />
      </div>
    </div>
  );
};

export default Login;
Login.Layout = 'NoLayout';
