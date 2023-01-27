```js
export interface Student {
  id: string;
  message: string;
}

export interface Teacher {
  id: string;
  info: string;
}

export class Demo5Component {
  student: Student = {
    id: '1',
    message: '我是学生',
  };
  teacher: Teacher = {
    id: '1',
    info: '我是老师',
  };

  showInfo(data: Student | Teacher): void {
    if (this._instanceOf<Student>('message', data)) {
      alert(data.message);
    } else if (this._instanceOf<Teacher>('info', data)) {
      alert(data.info);
    }
  }

  private _instanceOf<T>(key: string, type: Record<string, any>): type is T {
    return key in type;
  }
}
```

