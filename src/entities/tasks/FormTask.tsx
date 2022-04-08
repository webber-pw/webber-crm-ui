import {Button, Drawer, Form, Input, Select} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {AxiosError} from 'axios';
import {FC, memo, useCallback, useContext, useMemo, useState} from 'react';

import {useMutation, useQueryClient} from 'react-query';

import {PaginationResult} from '../../components/PaginationTable/types';
import Request from '../../components/utils/Request';
import $api from '../../http';
import API from '../../libs/API';

import {Context} from './Context';
import {StatusDTO, TaskDTO} from './types';

const {Item} = Form;

interface TaskContext {
    previousTasks: PaginationResult<TaskDTO>;
}

const FormTask: FC = memo((): JSX.Element | null => {
    const [visible, setVisible] = useState(false);
    const {item} = useContext(Context);

    const queryClient = useQueryClient();

    const isCreate = !item?.id;

    const onClose = useCallback(() => {
        setVisible(false);
    }, []);

    const {mutate: save, isLoading} = useMutation<TaskDTO, AxiosError, TaskDTO, TaskContext>(
        task =>
            new Promise((resolve, reject) => {
                try {
                    if (isCreate) {
                        return resolve($api.post(API.tasks(), task).then(response => response.data));
                    }

                    return resolve($api.patch(API.tasks(item.id), task).then(response => response.data));
                } catch (e) {
                    reject(new Error('Непредвиденная ошибка'));
                }
            }),
        {
            onSuccess: async () => {
                setVisible(false);
                await queryClient.invalidateQueries(API.tasks());
            },
        },
    );

    const initialValues = useMemo(() => ({...item, status: item.status?._id}), [item]);

    const ButtonStyle = useMemo(
        () =>
            isCreate
                ? {}
                : {
                      width: '100%',
                  },
        [isCreate],
    );

    return (
        <>
            <Button type="primary" style={ButtonStyle} onClick={() => setVisible(true)}>
                {isCreate ? 'Создать задачу' : 'Изменить'}
            </Button>

            <Drawer
                width={400}
                visible={visible}
                closable={!isLoading}
                maskClosable={!isLoading}
                onClose={onClose}
                destroyOnClose
                footer={
                    <Button loading={isLoading} block type="primary" htmlType="submit" form="formTask">
                        Сохранить
                    </Button>
                }
            >
                <Form name="formTask" colon={false} layout="vertical" initialValues={initialValues} onFinish={save}>
                    <Item name="title" label="Название задачи" rules={[{required: true}, {type: 'string', max: 64}]}>
                        <Input autoComplete="title" />
                    </Item>

                    <Item name="description" label="Описание" rules={[{type: 'string', max: 1024}]}>
                        <TextArea />
                    </Item>

                    {!isCreate && (
                        <Request
                            url={API.directory('status')}
                            queryKey={['status', {id: item.id}]}
                            render={(res: PaginationResult<StatusDTO>) => {
                                return (
                                    <Item name="status" label="Статус" rules={[{required: true}]}>
                                        <Select
                                            placeholder="Статус задачи"
                                            disabled={!res}
                                            loading={!res}
                                            options={res?.content.map(({_id: value, status_name: label}) => ({
                                                value,
                                                label,
                                            }))}
                                        />
                                    </Item>
                                );
                            }}
                        />
                    )}
                </Form>
            </Drawer>
        </>
    );
});

export default FormTask;
