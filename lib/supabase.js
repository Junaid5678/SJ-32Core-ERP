'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Yeh client automatic cookies set aur read karega jo middleware ke sath connect hongi
export const supabase = createClientComponentClient();
