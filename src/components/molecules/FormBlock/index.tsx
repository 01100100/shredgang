import * as React from 'react';
import { useState, useRef } from 'react';
import classNames from 'classnames';

import { DynamicComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';

export default function FormBlock(props) {
    const formRef = useRef<HTMLFormElement>(null);
    const { elementId, className, fields = [], submitLabel, styles = {} } = props;
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            setStatus('pending');
            setError(null);
            if (!formRef.current) {
                throw new Error('Form reference is not assigned');
            }
            const data = new FormData(formRef.current);
            const res = await fetch('/__forms.html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data as any).toString()
            });
            if (res.status === 200) {
                setStatus('ok');
            } else {
                setStatus('error');
                setError(`${res.status} ${res.statusText}`);
            }
        } catch (e) {
            setStatus('error');
            setError(`${e}`);
        }
    }

    return (
        <form
            className={classNames('sb-component', 'sb-component-block', 'sb-component-form-block', className)}
            name="signup"
            id="signup"
            onSubmit={handleSubmit}
            ref={formRef}
            data-netlify="true"
        >
            <input type="hidden" name="form-name" value="signup" />
            <div className="grid sm:grid-cols-2 sm:gap-x-4">
                {fields.map((field, index) => {
                    return <DynamicComponent key={index} {...field} />;
                })}
            </div>
            <div className={classNames('mt-4', 'flex justify-center', styles.submitLabel?.textAlign ? mapStyles({ textAlign: styles.submitLabel?.textAlign }) : null)}>
                <button type="submit" className="sb-component sb-component-block sb-component-button sb-component-button-primary" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Submitting...' : status === 'ok' ? 'Submitted! ✨' : submitLabel}
                </button>
            </div>
            {status === 'error' && (
                <div className="alert alert-error">
                    Error! 😵‍💫 {error}<br />Please reach out via contact@shredgang.cc
                </div>
            )}
        </form>
    );
}