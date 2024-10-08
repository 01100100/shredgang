import * as React from 'react';
import { useState } from 'react';
import classNames from 'classnames';

import { DynamicComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';

export default function FormBlock(props) {
    const formRef = React.createRef<HTMLFormElement>();
    const { elementId, className, fields = [], submitLabel, styles = {} } = props;
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    if (fields.length === 0) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            setStatus('pending');
            setError(null);
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
            name={elementId}
            id={elementId}
            onSubmit={handleSubmit}
            ref={formRef}
            data-netlify="true"
        >
            <input type="hidden" name="form-name" value={elementId} />
            <div className="grid sm:grid-cols-2 sm:gap-x-4">
                {fields.map((field, index) => {
                    return <DynamicComponent key={index} {...field} />;
                })}
            </div>
            <div className={classNames('mt-4', styles.submitLabel?.textAlign ? mapStyles({ textAlign: styles.submitLabel?.textAlign }) : null)}>
                <button type="submit" className="sb-component sb-component-block sb-component-button sb-component-button-primary" disabled={status === 'pending'}>
                    {submitLabel}
                </button>
            </div>
            {status === 'ok' && (
                <div className="alert alert-success">
                    Success! ✨
                </div>
            )}
            {status === 'error' && (
                <div className="alert alert-error">
                    Error! 😵‍💫 {error} Please reach out via contact@shredgang.cc
                </div>
            )}
        </form>
    );
}
