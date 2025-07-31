import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'
import { SignupForm } from '@/app/auth/sign-up/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default async function Page() {
    return (
        <div className={cn('flex flex-col gap-6')}>
            <Card>
                <CardHeader className="flex items-start text-center">
                    <div className="mr-2 flex-none pt-0.5">
                        <Link href="/auth/sign-in">
                            <ArrowLeft />
                        </Link>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">Welcome to Brand Afilliation</CardTitle>
                        <CardDescription>Create an account</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <SignupForm />
                </CardContent>
            </Card>
            <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
